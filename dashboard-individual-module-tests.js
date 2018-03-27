// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by dashboard-individual-module.js.
import { name as packageName } from "meteor/dashboard-individual-module";

// Write your tests here!
// Here is an example.
Tinytest.add('dashboard-individual-module - example', function (test) {
  test.equal(packageName, "dashboard-individual-module");
});
