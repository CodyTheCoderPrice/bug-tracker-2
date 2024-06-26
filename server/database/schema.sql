DROP DATABASE IF EXISTS bugtracker;

CREATE DATABASE bugtracker;

\c bugtracker;

CREATE OR REPLACE FUNCTION trigger_update_time_column() RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
  BEGIN
    NEW.update_time = now();
    RETURN NEW;
  END;
$$;

CREATE TABLE
  account (
    account_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    hash_pass VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    create_time timestamptz NOT NULL DEFAULT now (),
    update_time timestamptz NOT NULL DEFAULT now ()
  );

CREATE TRIGGER update_account_update_time
BEFORE UPDATE ON account
FOR EACH ROW
EXECUTE PROCEDURE trigger_update_time_column();

CREATE TABLE
  token (
    token_id SERIAL PRIMARY KEY,
    account_id INTEGER,
    refresh_token VARCHAR(255) UNIQUE,
    create_time timestamptz NOT NULL DEFAULT now (),
    CONSTRAINT fk_account FOREIGN KEY (account_id) REFERENCES account (account_id) ON DELETE CASCADE
  );

CREATE TABLE
  project (
    project_id SERIAL PRIMARY KEY,
    account_id INTEGER,
    name VARCHAR(255),
    description TEXT,
    create_time timestamptz NOT NULL DEFAULT now (),
    update_time timestamptz NOT NULL DEFAULT now (),
    CONSTRAINT fk_account FOREIGN KEY (account_id) REFERENCES account (account_id) ON DELETE CASCADE
  );

CREATE TRIGGER update_project_update_time
BEFORE UPDATE ON project
FOR EACH ROW
EXECUTE PROCEDURE trigger_update_time_column();

CREATE TABLE
  priority (
    priority_id SERIAL PRIMARY KEY,
    name TEXT,
    order_number SMALLINT
  );

INSERT INTO
  priority (name)
VALUES
  ('Low'),
  ('Medium'),
  ('High');

CREATE TABLE
  status (
    status_id SERIAL PRIMARY KEY,
    name TEXT,
    order_number SMALLINT,
    color TEXT,
    marks_completed BOOLEAN DEFAULT false
  );

INSERT INTO
  status (name)
VALUES
  ('Open'),
  ('In Progress'),
  ('Testing'),
  ('Closed');

CREATE TABLE
  bug (
    bug_id SERIAL PRIMARY KEY,
    project_id INTEGER,
    name VARCHAR(255),
    description TEXT,
    priority_id SMALLINT NOT NULL,
    status_id SMALLINT NOT NULL,
    create_time timestamptz NOT NULL DEFAULT now (),
    due_date DATE,
    complete_date DATE,
    update_time timestamptz NOT NULL DEFAULT now (),
    CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES project (project_id) ON DELETE CASCADE,
    CONSTRAINT fk_priority FOREIGN KEY (priority_id) REFERENCES priority (priority_id) ON DELETE SET NULL,
    CONSTRAINT fk_status FOREIGN KEY (status_id) REFERENCES status (status_id) ON DELETE SET NULL
  );

CREATE TRIGGER update_bug_update_time
BEFORE UPDATE ON bug
FOR EACH ROW
EXECUTE PROCEDURE trigger_update_time_column();

CREATE TABLE
  comment (
    comment_id SERIAL PRIMARY KEY,
    bug_id INTEGER,
    description TEXT,
    create_time timestamptz NOT NULL DEFAULT now (),
    update_time timestamptz NOT NULL DEFAULT now (),
    CONSTRAINT fk_bug FOREIGN KEY (bug_id) REFERENCES bug (bug_id) ON DELETE CASCADE
  );

CREATE TRIGGER update_comment_update_time
BEFORE UPDATE ON comment
FOR EACH ROW
EXECUTE PROCEDURE trigger_update_time_column();
