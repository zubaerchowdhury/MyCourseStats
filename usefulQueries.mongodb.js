/* global use, db */
// MongoDB Playground
// Make sure you are connected to enable completions and to be able to run a playground.
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.
// The result of the last command run in a playground is shown on the results panel.
// By default the first 20 documents will be returned with a cursor.
// Use 'console.log()' to print to the debug output.
// For more documentation on playgrounds please refer to
// https://www.mongodb.com/docs/mongodb-vscode/playgrounds/

// 'use('courses');' is in every query so that they can be run individually.

// Find all instructors for a specific course
use("courses"); // Select the database to use
subjectCode = "ECE";
catalogNumber = "421";
db.getCollection("sections").aggregate(
  [
    {
      $match: {
        // subjectName: `${subjectName}`,
				subjectCode: `${subjectCode}`,
        catalogNumber: `${catalogNumber}`,
        instructor: {
          $nin: ["X TBA", null],
        },
      },
    },
    {
      $unwind: {
        path: "$instructor",
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $unwind: {
        path: "$instructor",
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $group: {
        _id: {
          // subjectName: "$subjectName",
          subjectCode: "$subjectCode",
          catalogNumber: "$catalogNumber",
        },
        instructors: {
          $addToSet: "$instructor",
        },
      },
    }
  ],
  { maxTimeMS: 60000, allowDiskUse: true }
);

// Match courses with time series data
use("courses");
db.getCollection("sections").aggregate(
  [
    {
      $lookup: {
        from: "sectionsTS",
        let: {
          sem: "$semester",
          year: "$year",
          classNum: "$classNumber",
          dtr: "$dateTimeRetrieved",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$courseInfo.semester", "$$sem"],
                  },
                  {
                    $eq: ["$courseInfo.year", "$$year"],
                  },
                  {
                    $eq: ["$courseInfo.classNumber", "$$classNum"],
                  },
                  {
                    $eq: ["$dateTimeRetrieved", "$$dtr"],
                  },
                ],
              },
            },
          },
          {
            $project: {
              _id: 0,
              dateTimeRetrieved: 0,
              courseInfo: 0,
            },
          },
        ],
        as: "courseStats",
      },
    },
    {
      $unwind: {
        path: "$courseStats",
        preserveNullAndEmptyArrays: true,
      },
    },
  ],
  { maxTimeMS: 60000, allowDiskUse: true }
);

// Find latest dateTimeRetrieved
use("courses");
db.getCollection("sectionsTS").findOne(
	{},
	{ dateTimeRetrieved: 1, _id: 0 },
	{ sort: { dateTimeRetrieved: -1 } }
);