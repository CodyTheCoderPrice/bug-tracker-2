import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Link } from "react-router-dom";
import { toggleCreateProjectModal } from "@/features/system/systemSlice";
import { deleteProject } from "./projectSlice";

function ProjectList() {
  const dispatch = useAppDispatch();

  const {
    projects,
    isDeleteProjectLoading,
    hasDeleteProjectSucceeded,
    deleteProjectErrors,
  } = useAppSelector((state) => state.projects);

  return (
    <>
      <button
        onClick={() => {
          dispatch(toggleCreateProjectModal());
        }}
      >
        Open Create Project Modal
      </button>
      <h1>Projects List</h1>
      {projects?.length === 0 ? (
        <p>No projects</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Project id</th>
                <th>Name</th>
                <th>Description</th>
                <th>create time</th>
                <th>Update time</th>
              </tr>
            </thead>
            <tbody>
              {projects?.map((project, idx) => {
                return (
                  <tr key={idx}>
                    <td style={{ padding: "5px 20px" }}>
                      {project.project_id}
                    </td>
                    <td style={{ padding: "0 20px" }}>{project.name}</td>
                    <td style={{ padding: "0 20px" }}>{project.description}</td>
                    <td style={{ padding: "0 20px" }}>
                      {project.create_time.toString()}
                    </td>
                    <td style={{ padding: "0 20px" }}>
                      {project.update_time.toString()}
                    </td>
                    <td style={{ padding: "0 20px" }}>
                      <Link to={`/projects/${project.project_id}`}>Edit</Link>
                    </td>
                    <td style={{ padding: "0 20px" }}>
                      <button
                        type="button"
                        onClick={() =>
                          dispatch(
                            deleteProject({ project_id: project.project_id }),
                          )
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {isDeleteProjectLoading && <h3>Loading...</h3>}
          {hasDeleteProjectSucceeded && <p>Project Deleted</p>}
          {deleteProjectErrors?.project_id && (
            <p style={{ color: "red" }}>{deleteProjectErrors.project_id}</p>
          )}
          {deleteProjectErrors?.server && (
            <p style={{ color: "red" }}>{deleteProjectErrors.server}</p>
          )}
        </>
      )}
    </>
  );
}

export default ProjectList;
