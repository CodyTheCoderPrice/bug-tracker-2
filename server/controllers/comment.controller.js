const { matchedData } = require('express-validator');
const pool = require('../database/db.js');
const {
	getIsBugBelongingToAccountInDB,
	getCommentsFromDB,
	getIsCommentBelongingToAccountInDB,
} = require('../utils/queries.js');
const { CustomError } = require('../utils/classes.js');

/**
 * Controller to create a comment in the DB.
 *
 * NOTE: Intended to run after authToken, checkSchema and schemaErrorHandler.
 */
const createComment = async (req, res, next) => {
	try {
		const data = matchedData(req);
		const { bug_id, description } = data;

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

		const createdComment = await pool.query(
			`INSERT INTO comment (bug_id, description)
            VALUES ($1, $2)
         RETURNING bug_id`,
			[bug_id, description]
		);

		if (createdComment.rowCount === 0) {
			throw new Error('Database failed to create comment');
		}

		const comments = await getCommentsFromDB(account_id);

		if (comments == null) {
			throw new Error('getCommentsFromDB returned without comments array');
		}

		return res.status(200).json({ comments: comments.rows });
	} catch (err) {
		err.message = `create-comment: ${err.message}`;
		next(err);
	}
};

/**
 * Controller to update a comment in the DB.
 *
 * NOTE: Intended to run after authToken, checkSchema and schemaErrorHandler.
 */
const updateComment = async (req, res, next) => {
	try {
		const data = matchedData(req);
		const { comment_id, bug_id, description } = data;

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

		const isCommentBelongingToAccount =
			await getIsCommentBelongingToAccountInDB(account_id, comment_id);

		if (!isCommentBelongingToAccount) {
			throw new CustomError('Comment ID does not belong to account', 403, {
				errors: { bug_id: 'Comment ID does not belong to account' },
			});
		}

		const updatedComment = await pool.query(
			`UPDATE comment
          SET bug_id = $1, description = $2
        WHERE comment_id = $3
       RETURNING comment_id`,
			[bug_id, description, comment_id]
		);

		if (updatedComment.rowCount === 0) {
			throw new Error('Database failed to update bug');
		}

		const comments = await getCommentsFromDB(account_id);

		if (comments == null) {
			throw new Error('getCommentsFromDB returned without comments array');
		}

		return res.status(200).json({ comments: comments.rows });
	} catch (err) {
		err.message = `update-comment: ${err.message}`;
		next(err);
	}
};

/**
 * Controller to delete a comment in the DB.
 *
 * NOTE: Intended to run after authToken, checkSchema and schemaErrorHandler.
 */
const deleteComment = async (req, res, next) => {
	try {
		const data = matchedData(req);
		const { comment_id } = data;

		// Declared in authToken middleware
		const account_id = res.locals.account_id;

		if (account_id == null) {
			throw new Error('res.locals missing account_id');
		}

		const isCommentBelongingToAccount =
			await getIsCommentBelongingToAccountInDB(account_id, comment_id);

		if (!isCommentBelongingToAccount) {
			throw new CustomError('Comment ID does not belong to account', 403, {
				errors: { bug_id: 'Comment ID does not belong to account' },
			});
		}

		const deletedComment = await pool.query(
			`DELETE FROM comment
        WHERE comment_id = $1`,
			[comment_id]
		);

		if (deletedComment.rowCount === 0) {
			throw new Error('Database failed to delete comment');
		}

		const comments = await getCommentsFromDB(account_id);

		if (comments == null) {
			throw new Error('getCommentsFromDB returned without comments array');
		}

		return res.status(200).json({ comments: comments.rows });
	} catch (err) {
		err.message = `delete-comment: ${err.message}`;
		next(err);
	}
};

module.exports = { createComment, updateComment, deleteComment };
