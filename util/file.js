const fs = require("fs");

exports.deleteFile = (file) => {
  fs.unlink(file, (err) => {
    if (err) {
      throw err;
    }
  });
};
