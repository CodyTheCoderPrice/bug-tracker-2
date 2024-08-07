const { matchedData } = require('express-validator');
const pool = require('../database/db.js');
const {
	getIsProjectBelongingToAccountInDB,
	getIsBugBelongingToAccountInDB,
	getBugsFromDB,
	getCommentsFromDB,
} = require('../utils/queries.js');
const { CustomError } = require('../utils/classes.js');

/**
 * Controller to create a bug in the DB.
 *
 * NOTE: Intended to run after authToken, checkSchema and schemaErrorHandler.
 */
const createBug = async (req, res, next) => {
	try {
		const data = matchedData(req);
		const {
			project_id,
			name,
			description,
			priority_id,
			status_id,
			due_date,
			complete_date,
		} = data;

		// Declared in authToken middleware
		const account_id = res.locals.account_id;

		if (account_id == null) {
			throw new Error('res.locals missing account_id');
		}

		const isProjectBelongingToAccount =
			await getIsProjectBelongingToAccountInDB(account_id, project_id);

		if (!isProjectBelongingToAccount) {
			throw new CustomError('Project ID does not belong to account', 403, {
				errors: { project_id: 'Project ID does not belong to account' },
			});
		}

		const createdBug = await pool.query(
			`INSERT INTO bug (project_id, name, description, priority_id,
                          status_id, due_date, complete_date)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING bug_id`,
			[
				project_id,
				name,
				description,
				priority_id,
				status_id,
				due_date,
				complete_date,
			]
		);

		if (createdBug.rowCount === 0) {
			throw new Error('Database failed to create bug');
		}

		const bugs = await getBugsFromDB(account_id);

		if (bugs == null) {
			throw new Error('getBugsFromDB returned without bugs array');
		}

		return res.status(200).json({ bugs: bugs.rows });
	} catch (err) {
		err.message = `create-bug: ${err.message}`;
		next(err);
	}
};

/**
 * Controller to update a bug in the DB.
 *
 * NOTE: Intended to run after authToken, checkSchema and schemaErrorHandler.
 */
const updateBug = async (req, res, next) => {
	try {
		const data = matchedData(req);
		const {
			bug_id,
			project_id,
			name,
			description,
			priority_id,
			status_id,
			due_date,
			complete_date,
		} = data;

		// Declared in authToken middleware
		const account_id = res.locals.account_id;

		if (account_id == null) {
			throw new Error('res.locals missing account_id');
		}

		const isProjectBelongingToAccount =
			await getIsProjectBelongingToAccountInDB(account_id, project_id);

		if (!isProjectBelongingToAccount) {
			throw new CustomError('Project ID does not belong to account', 403, {
				errors: { project_id: 'Project ID does not belong to account' },
			});
		}

		const isBugBelongingToAccount = await getIsBugBelongingToAccountInDB(
			account_id,
			bug_id
		);

		if (!isBugBelongingToAccount) {
			throw new CustomError('Bug ID does not belong to account', 403, {
				errors: { bug_id: 'Bug ID does not belong to account' },
			});
		}

		const updatedBug = await pool.query(
			`UPDATE bug
          SET project_id = $1, name = $2, description = $3, priority_id = $4,
					status_id = $5, due_date = $6, complete_date = $7
        WHERE bug_id = $8
       RETURNING bug_id`,
			[
				project_id,
				name,
				description,
				priority_id,
				status_id,
				due_date,
				complete_date,
				bug_id,
			]
		);

		if (updatedBug.rowCount === 0) {
			throw new Error('Database failed to update bug');
		}

		const bugs = await getBugsFromDB(account_id);

		if (bugs == null) {
			throw new Error('getBugsFromDB returned without bugs array');
		}

		return res.status(200).json({ bugs: bugs.rows });
	} catch (err) {
		err.message = `update-bug: ${err.message}`;
		next(err);
	}
};

/**
 * Controller to delete a bug in the DB.
 *
 * NOTE: Intended to run after authToken, checkSchema and schemaErrorHandler.
 */
const deleteBug = async (req, res, next) => {
	try {
		const data = matchedData(req);
		const { bug_id } = data;

		// Declared in authToken middleware
		const account_id = res.locals.account_id;

		if (account_id == null) {
			throw new Error('res.locals missing account_id');
		}

		const isBugBelongingToAccount = await getIsBugBelongingToAccountInDB(
			account_id,
			bug_id
		);

		if (!isBugBelongingToAccount) {
			throw new CustomError('Bug ID does not belong to account', 403, {
				errors: { bug_id: 'Bug ID does not belong to account' },
			});
		}

		const deletedBug = await pool.query(
			`DELETE FROM bug
        WHERE bug_id = $1`,
			[bug_id]
		);

		if (deletedBug.rowCount === 0) {
			throw new Error('Database failed to delete bug');
		}

		const bugs = await getBugsFromDB(account_id);
		const comments = await getCommentsFromDB(account_id);

		if (bugs == null) {
			throw new Error('getBugsFromDB returned without bugs array');
		}

		if (comments == null) {
			throw new Error('getCommentsFromDB returned without comments array');
		}

		return res.status(200).json({ bugs: bugs.rows, comments: comments.rows });
	} catch (err) {
		err.message = `delete-bug: ${err.message}`;
		next(err);
	}
};

module.exports = { createBug, updateBug, deleteBug };
