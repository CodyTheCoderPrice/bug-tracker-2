const { Router } = require('express');
const { matchedData, checkSchema } = require('express-validator');
const {
	schemaErrorHandler,
} = require('../middleware/errors/schemaErrorHandler.js');
const pool = require('../db');
const bcrypt = require('bcrypt');
const registerAccountSchema = require('../middleware/validation/account/registerSchema.js');
const updateEmailSchema = require('../middleware//validation/account/updateEmailSchema.js');
const updatePasswordSchema = require('../middleware/validation/account/updatePasswordSchema.js');
const updateNameSchema = require('../middleware/validation/account/updateNameSchema.js');
const deleteAccountSchema = require('../middleware/validation/account/deleteAccountSchema.js');
const {
	authenticateToken,
} = require('../middleware/auth/authenticateToken.js');
const {
	authenticatePassword,
} = require('../middleware/auth/authenticatePassword.js');
const {
	confirmPwdMatches,
} = require('../middleware/validation/account/confirmPwdMatches.js');
const { CustomError } = require('../utils/classes.js');

const router = Router();

//==================
// Register account
//==================
router.post(
	'/register',
	[checkSchema(registerAccountSchema), schemaErrorHandler],
	async (req, res, next) => {
		try {
			const data = matchedData(req);
			const { email, pwd, first_name, last_name } = data;

			const emailInUse =
				(
					await pool.query(
						`SELECT account_id
								 FROM account
								WHERE LOWER(email) = LOWER($1)`,
						[email]
					)
				).rowCount > 0;

			if (emailInUse) {
				throw new CustomError('Email already in use', 400, {
					errors: { email: 'Email already in use' },
				});
			}

			const saltRounds = 10;
			const salt = bcrypt.genSaltSync(saltRounds);
			const hash_pass = bcrypt.hashSync(pwd, salt);

			await pool.query(
				`INSERT INTO account (email, hash_pass, first_name, last_name)
						  VALUES ($1, $2, $3, $4)
				   RETURNING account_id`,
				[email, hash_pass, first_name, last_name]
			);

			return res.status(201).json({ msg: 'Account created' });
		} catch (err) {
			err.message = `register-account: ${err.message}`;
			next(err);
		}
	}
);

//=============
// Update Name
//=============
router.post(
	'/update-name',
	authenticateToken,
	[checkSchema(updateNameSchema), schemaErrorHandler],
	async (req, res, next) => {
		try {
			const data = matchedData(req);
			const { first_name, last_name } = data;

			// Declared in authenticateToken middleware
			const account_id = res.locals.account_id;

			if (account_id == null) {
				throw new Error('res.locals missing account_id');
			}

			const updatedAccount = await pool.query(
				`UPDATE account
							SET first_name = $1, last_name = $2
						WHERE account_id = $3
					 RETURNING account_id, email, first_name, last_name, create_time, update_time`,
				[first_name, last_name, account_id]
			);

			if (updatedAccount.rowCount === 0) {
				throw new Error('Database failed to update account name');
			}

			return res.status(200).json({ account: updatedAccount.rows[0] });
		} catch (err) {
			err.message = `update-name: ${err.message}`;
			next(err);
		}
	}
);

//==============
// Update Email
//==============
router.post(
	'/update-email',
	authenticateToken,
	[checkSchema(updateEmailSchema), schemaErrorHandler],
	authenticatePassword,
	async (req, res, next) => {
		try {
			const data = matchedData(req);
			const { email } = data;

			// Declared in authenticateToken middleware
			const account_id = res.locals.account_id;

			if (account_id == null) {
				throw new Error('res.locals missing account_id');
			}

			const emailInUse =
				(
					await pool.query(
						`SELECT account_id
								 FROM account
								WHERE LOWER(email) = LOWER($1)`,
						[email]
					)
				).rowCount > 0;

			if (emailInUse) {
				throw new CustomError('Email already in use', 400, {
					errors: { email: 'Email already in use' },
				});
			}

			const updatedAccount = await pool.query(
				`UPDATE account
							SET email = $1
						WHERE account_id = $2
					 RETURNING account_id, email, first_name, last_name, create_time, update_time`,
				[email, account_id]
			);

			if (updatedAccount.rowCount === 0) {
				throw new Error('Database failed to update account email');
			}

			return res.status(200).json({ account: updatedAccount.rows[0] });
		} catch (err) {
			err.message = `update-email: ${err.message}`;
			next(err);
		}
	}
);

//=================
// Update Password
//=================
router.post(
	'/update-password',
	authenticateToken,
	[checkSchema(updatePasswordSchema), schemaErrorHandler],
	confirmPwdMatches,
	authenticatePassword,
	async (req, res, next) => {
		try {
			const data = matchedData(req);
			const { newPwd } = data;

			// Declared in authenticateToken middleware
			const account_id = res.locals.account_id;

			if (account_id == null) {
				throw new Error('res.locals missing account_id');
			}

			const saltRounds = 10;
			const salt = bcrypt.genSaltSync(saltRounds);
			const new_hash_pass = bcrypt.hashSync(newPwd, salt);

			const updatedAccount = await pool.query(
				`UPDATE account
							SET hash_pass = $1
						WHERE account_id = $2
					 RETURNING account_id, email, first_name, last_name, create_time, update_time`,
				[new_hash_pass, account_id]
			);

			if (updatedAccount.rowCount === 0) {
				throw new Error('Database failed to update account password');
			}

			return res.status(200).json({ account: updatedAccount.rows[0] });
		} catch (err) {
			err.message = `update-password: ${err.message}`;
			next(err);
		}
	}
);

//=================
// Delete Acccount
//=================
router.delete(
	'/delete',
	authenticateToken,
	[checkSchema(deleteAccountSchema), schemaErrorHandler],
	authenticatePassword,
	async (req, res, next) => {
		try {
			// Declared in authenticateToken middleware
			const account_id = res.locals.account_id;

			if (account_id == null) {
				throw new Error('res.locals missing account_id');
			}

			const deletedAccount = await pool.query(
				`DELETE FROM account
					WHERE account_id = $1`,
				[account_id]
			);

			if (deletedAccount.rowCount === 0) {
				throw new Error('Database failed to delete account');
			}

			return res.status(200).json({ msg: 'Account deleted' });
		} catch (err) {
			err.message = `delete-account: ${err.message}`;
			next(err);
		}
	}
);

module.exports = { accountRouter: router };
