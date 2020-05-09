const Joi = require('joi');
const express = require('express');
const fs = require('fs');

const app = express();
const file_path = __dirname + '/courses.json';
app.use(express.json());

const readData = () => {
	const objToBeParsed = fs.readFileSync(file_path, 'utf-8');
	//console.log(objToBeParsed);

	const dataParsed = JSON.parse(objToBeParsed);
	//	console.log(dataParsed);

	return dataParsed;
};
const courses = readData();

const writeToCourses = async () => {
	const callbackWrite = (err, content) => {
		if (err) {
			return console.error(err);
		}

		console.log(`write JSON done ... \n${content}`);
	};

	const writingData = JSON.stringify(courses, null, 2);
	fs.writeFile(file_path, writingData, callbackWrite);
};

app.get('/api/courses', (req, res) => {
	res.send(courses);
});

app.get('/api/courses/:id', (req, res) => {
	const course = courses.find((c) => c.id === parseInt(req.params.id));

	if (!course) return res.status(404).send('The course with the given ID was not found.');
	res.send(course);
});

app.post('/api/courses', (req, res) => {
	// object restructuring
	const { error } = validationCourse(req.body); // result.error

	if (error) {
		// 400 Bad request
		// res.status(400).send(result.error);
		res.status(400).send(error.details[0].message);
		return;
	}
	const course = {
		id: courses.length + 1,
		name: req.body.name
	};
	courses.push(course);

	writeToCourses(courses);

	res.send(course);
});

app.put('/api/courses/:id', (req, res) => {
	// Look up the course
	// If not existing, return 404
	const course = courses.find((c) => c.id === parseInt(req.params.id));

	if (!course) {
		res.status(404).send('The course with the given Id was not found..');
		return;
	}

	// object restructuring
	const { error } = validationCourse(req.body); // result.error

	if (error) {
		// 400 Bad request
		// res.status(400).send(result.error);
		res.status(400).send(error.details[0].message);
		return;
	}
	// Update course
	course.name = req.body.name;

	// Update Json file...
	writeToCourses();

	// Return the updated course
	res.send(course);
});

function validationCourse(course) {
	const schema = {
		name: Joi.string().min(3).required()
	};

	return Joi.validate(course, schema);
}

app.delete('/api/courses/:id', (req, res) => {
	// Look up the course
	//  Not existing, return 404
	const course = courses.find((c) => c.id === parseInt(req.params.id));

	if (!course) return res.status(404).send('The course with the given Id was not found.');

	// Delete
	const index = courses.indexOf(course);
	courses.splice(index, 1);

	writeToCourses();

	// Return the same course
	res.send(course);
});

// PORT environment variable..
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on port ${port}...`));
