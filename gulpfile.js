"use strict";

/* eslint-disable no-console */
const gulp = require("gulp");
const s3 = require("s3");
const git = require("gulp-git");
const notify = require("gulp-notify");
const fs = require("fs-extra");
const shell = require("gulp-shell");

let NEW_TAG;

// S3 info
const BUCKET = "panpal-assets";
const PANPAL_PREFIX = "panpal";
const APP_DEST = "./dist/";
const S3_CLIENT_OPTIONS = {
  maxAsyncS3: 20, // this is the default
  s3RetryCount: 3, // this is the default
  s3RetryDelay: 1000, // this is the default
  multipartUploadThreshold: 20971520, // this is the default (20 MB)
  multipartUploadSize: 15728640, // this is the default (15 MB)
  s3Options: {
    region: "us-east-1",
  },
};

// Preset Constants
const VERSION_FILE_NAME = "production_version";
const VERSION_FILE_PATH = `./tmp/${VERSION_FILE_NAME}`;

// comes from jenkins
const DEPLOY_VERSION = process.env.DEPLOY_VERSION;

const errorHandler = err => {
  notify.onError({
    message: "Error: <%= error.message %>",
    title: "Encountered error. Exiting with exit code 1",
  })(err);
  process.exit(1);
};

gulp.task("add-demo-tag", callback => {
  process.env.BRANCH_NAME = "refs/origin/master";

  if (!process.env.BRANCH_NAME.split("/")[2]) {
    errorHandler(
      new Error("add-demo-tag cant be run without ENV variable BRANCH_NAME"),
    );
    return;
  }
  NEW_TAG = process.env.BRANCH_NAME.split("/")[2];
  callback();
});

gulp.task("add-tag", callback => {
  NEW_TAG = new Date().toISOString().replace(/:/g, "-");
  git.tag(NEW_TAG, "Deploying to S3", err => {
    if (err) {
      errorHandler(err);
    }
    callback();
  });
});

gulp.task("add-production-tag", callback => {
  new Promise((resolve, reject) => {
    git.exec(
      {
        args: "tag -d production",
      },
      err => {
        if (err) reject(err);
        else resolve();
      },
    );
  })
    .then(
      () =>
        new Promise((resolve, reject) => {
          git.tag("production", "Deploying to S3", err => {
            if (err) reject(err);
            else resolve();
          });
        }),
    )
    .then(callback);
});

gulp.task("push-tag", callback => {
  git.exec(
    {
      args: `push https://${process.env.GH_TOKEN}@github.com/balmbees/mingle --tags -f`,
    },
    callback,
  );
});

gulp.task("check-cleanness", callback => {
  git.status(
    {
      args: " --porcelain",
    },
    (err, stdout) => {
      if (!!stdout) {
        git.exec(
          {
            args: "diff package-lock.json",
          },
          (err, stdout) => {
            console.log(stdout);
            errorHandler(new Error("Found unsynced changes"));
          },
        );
        return;
      }
      callback();
    },
  );
});

gulp.task("clean-dist", callback => {
  fs.remove("dist", err => {
    if (err) {
      errorHandler(err);
    }
    callback();
  });
});

gulp.task(
  "package-production",
  shell.task(`webpack --config ./webpack.prod.config.js`),
);

gulp.task(
  "package-main",
  shell.task(`webpack --config ./webpack.browser.config.js`),
);

gulp.task("push-to-s3", callback => {
  if (!NEW_TAG || !fs.existsSync(APP_DEST)) {
    return Promise.reject(new Error("push-to-s3 cant be run by itself"));
  }

  const s3Client = s3.createClient(S3_CLIENT_OPTIONS);
  const uploadPromises = [];
  const files = fs.readdirSync(APP_DEST);

  files.forEach(file => {
    const uploadOption = {
      localFile: APP_DEST + file,
      s3Params: {
        Bucket: BUCKET,
        Key: `${PANPAL_PREFIX}/${NEW_TAG}/${file}`,
        CacheControl: "public, max-age=604800",
      },
    };
    const uploaderPromise = new Promise(resolve => {
      s3Client
        .uploadFile(uploadOption)
        .on("error", err => {
          console.error(`FILE: ${file} : unable to sync`, err.stack);
          errorHandler(err);
          reject(err);
        })
        .on("end", () => {
          console.log(`${file} upload done`);
          resolve();
        });
    });
    uploadPromises.push(uploaderPromise);
  });

  console.log("before start");
  Promise.all(uploadPromises)
    .then(() => {
      callback();
    })
    .catch(errorHandler);
});

gulp.task("record-tag", callback => {
  if (!NEW_TAG) {
    return Promise.reject(new Error("record-tag cant be run by itself")).catch(
      errorHandler,
    );
  }

  return new Promise(() => {
    fs.outputFile("tmp/version", NEW_TAG, err => {
      if (err) {
        errorHandler(err);
      }
      callback(err);
    });
  });
});

gulp.task("change-version-file", callback => {
  if (!DEPLOY_VERSION) {
    console.error("change-version-file job needs target DEPLOY_VERSION!!!");
    return;
  }

  fs.outputFileSync(VERSION_FILE_PATH, DEPLOY_VERSION);

  const s3Client = s3.createClient(S3_CLIENT_OPTIONS);
  const uploader = s3Client.uploadFile({
    localFile: VERSION_FILE_PATH,
    s3Params: {
      Bucket: BUCKET,
      Key: `${PANPAL_PREFIX}/${VERSION_FILE_NAME}`,
      CacheControl: "public, max-age=604800",
    },
  });

  uploader.on("error", err => {
    console.error("unable to sync:", err.stack);

    errorHandler(err);
    callback(err);
  });
  uploader.on("progress", () => {
    console.log("progress", uploader.progressAmount, uploader.progressTotal);
  });
  uploader.on("end", () => {
    console.log("done uploading");

    callback();
  });
});

gulp.task(
  "package",
  gulp.parallel("clean-dist", "package-main", "package-production", callback =>
    callback(),
  ),
);

// build demo branch
gulp.task(
  "deploy-demo",
  gulp.series("clean-dist", "add-demo-tag", "package", "push-to-s3", callback =>
    callback(),
  ),
);

// build master branch
gulp.task(
  "deploy-to-stage",
  gulp.series(
    "clean-dist",
    "add-tag",
    "package",
    "push-to-s3",
    "push-tag",
    "record-tag",
    callback => callback(),
  ),
);

// not build, just change target version file and upload to production deploy
gulp.task(
  "deploy-to-production",
  gulp.series(
    "add-production-tag",
    "change-version-file",
    "push-tag",
    callback => callback(),
  ),
);
