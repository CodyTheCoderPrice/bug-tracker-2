import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useState } from "react";
import { createBug } from "./bugSlice";

type TBugInfo = {
  project_id: number;
  name: string;
  description: string;
  priority_id: number;
  status_id: number;
  due_date: string;
  complete_date: string;
};

function CreateBug() {
  const dispatch = useAppDispatch();

  const { projects } = useAppSelector((state) => state.projects);

  const [bugInfo, setBugInfo] = useState<TBugInfo>({
    project_id: projects && projects.length > 0 ? projects[0].project_id : -1,
    name: "",
    description: "",
    priority_id: 1,
    status_id: 1,
    due_date: "",
    complete_date: "",
  });

  const handleInput = (
    e: React.ChangeEvent<
      HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
    >,
  ) => {
    setBugInfo({ ...bugInfo, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(createBug(bugInfo));
  };

  const { isCreateBugLoading, hasCreateBugSucceeded, createBugErrors } =
    useAppSelector((state) => state.bugs);

  return (
    <>
      <h1>Create Bug</h1>
      {projects?.length === 0 ? (
        <p>No projects</p>
      ) : (
        <>
          <form noValidate autoComplete="off" onSubmit={handleSubmit}>
            <select
              name="project_id"
              onChange={handleInput}
              defaultValue={bugInfo.project_id}
              style={{ display: "block" }}
            >
              {projects?.map((project, idx) => {
                return (
                  <option key={idx} value={project.project_id}>
                    {project.name}
                  </option>
                );
              })}
            </select>
            <input
              type="text"
              name="name"
              placeholder="Bug name"
              onChange={handleInput}
              value={bugInfo.name}
              style={{ display: "block", width: "227px" }}
            />
            <textarea
              name="description"
              placeholder="Description"
              onChange={handleInput}
              value={bugInfo.description}
              rows={4}
              cols={30}
              style={{ display: "block" }}
            />
            <select
              name="priority_id"
              onChange={handleInput}
              defaultValue={bugInfo.priority_id}
              style={{ display: "block" }}
            >
              <option value={1}>Low</option>
              <option value={2}>Medium</option>
              <option value={3}>High</option>
            </select>
            <select
              name="status_id"
              onChange={handleInput}
              defaultValue={bugInfo.status_id}
              style={{ display: "block" }}
            >
              <option value={1}>Open</option>
              <option value={2}>In Progress</option>
              <option value={3}>Testing</option>
              <option value={4}>Closed</option>
            </select>
            <input
              type="date"
              name="due_date"
              onChange={handleInput}
              value={bugInfo.due_date !== null ? bugInfo.due_date : ""}
              style={{ display: "block" }}
            />
            <input
              type="date"
              name="complete_date"
              onChange={handleInput}
              value={
                bugInfo.complete_date !== null ? bugInfo.complete_date : ""
              }
              style={{ display: "block" }}
            />
            <button type="submit">Create</button>
          </form>
          {isCreateBugLoading && <h3>Loading...</h3>}
          {hasCreateBugSucceeded && <p>Bug Created</p>}
          {createBugErrors?.project_id && (
            <p style={{ color: "red" }}>{createBugErrors.project_id}</p>
          )}
          {createBugErrors?.name && (
            <p style={{ color: "red" }}>{createBugErrors.name}</p>
          )}
          {createBugErrors?.description && (
            <p style={{ color: "red" }}>{createBugErrors.description}</p>
          )}
          {createBugErrors?.priority_id && (
            <p style={{ color: "red" }}>{createBugErrors.priority_id}</p>
          )}
          {createBugErrors?.status_id && (
            <p style={{ color: "red" }}>{createBugErrors.status_id}</p>
          )}
          {createBugErrors?.due_date && (
            <p style={{ color: "red" }}>{createBugErrors.due_date}</p>
          )}
          {createBugErrors?.complete_date && (
            <p style={{ color: "red" }}>{createBugErrors.complete_date}</p>
          )}
          {createBugErrors?.server && (
            <p style={{ color: "red" }}>{createBugErrors.server}</p>
          )}
        </>
      )}
    </>
  );
}

export default CreateBug;
