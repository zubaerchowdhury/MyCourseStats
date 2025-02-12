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


// Find all instructors for a specific course.
use('courses'); // Select the database to use.
subjectName = 'Architecture';
subjectCode = 'ARC';
catalogNumber = '586';
db.getCollection('sections').aggregate(
  [
    {
      $match: {
        subject: `('${subjectName}', '${subjectCode}')`,
        catalogNumber: catalogNumber,
        instructor: { $nin: ['X TBA', null] }
      }
    },
    {
      $group: {
        _id: {
          subject: '$subject',
          catalogNumber: '$catalogNumber'
        },
        instructors: { $addToSet: '$instructor' }
      }
    },
    {
      $project: {
        _id: 0,
        instructors: '$instructors'
      }
    }
  ],
  { maxTimeMS: 60000, allowDiskUse: true }
);