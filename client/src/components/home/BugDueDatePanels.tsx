import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  setHomeDueSoonFilterOption,
  setHomeOverdueFilterOption,
  THomeFilter,
} from "@/features/system/systemSlice";
import { TBug } from "@/features/bugs/bugSlice";
import { sortBugsByDueDate } from "@/utils/sortUtils";
import {
  filterDueSoonBugsByDate,
  filterBugsByPage,
  filterOverdueBugsByDate,
} from "@/utils/filterUtils";
import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import moment from "moment";
import TablePagingFooter from "../table/TablePagingFooter";

type TProps = {
  isWideScreen: boolean;
};

function BugDueDatePanels(props: TProps) {
  const dispatch = useAppDispatch();

  const { bugs } = useAppSelector((state) => state.bugs);
  const { hasTransition, homeDueSoonFilterOption, homeOverdueFilterOption } =
    useAppSelector((state) => state.system);

  const [dueSoonBugs, setDueSoonBugs] = useState<TBug[] | null>(null);
  const [overdueBugs, setOverdueBugs] = useState<TBug[] | null>(null);

  useEffect(() => {
    setDueSoonBugs(
      sortBugsByDueDate(filterDueSoonBugsByDate(bugs, homeDueSoonFilterOption)),
    );
  }, [bugs, homeDueSoonFilterOption]);

  useEffect(() => {
    setOverdueBugs(
      sortBugsByDueDate(filterOverdueBugsByDate(bugs, homeOverdueFilterOption)),
    );
  }, [bugs, homeOverdueFilterOption]);

  const getTitleHeader = (title: string) => {
    return <h2 className="text-xl font-semibold">{title}</h2>;
  };

  const getFilterButtons = (
    setFilterFunc: ActionCreatorWithPayload<
      THomeFilter,
      "system/setHomeDueSoonFilterOption" | "system/setHomeOverdueFilterOption"
    >,
    isDueSoon: boolean,
  ) => {
    const filterOnClick = (filter: THomeFilter) => {
      dispatch(setFilterFunc(filter));
    };
    const filterSelected = isDueSoon
      ? homeDueSoonFilterOption
      : homeOverdueFilterOption;
    // Shared classNames
    const buttonShared =
      (hasTransition ? " transition-bg " : "") +
      " border-color-dl border px-4 py-[1px] ";
    const selectedShared = " bg-primary-200 dark:bg-primary-400 text-white ";
    return (
      <div className="mt-6 font-medium text-primary-400 dark:text-plain-light-100">
        <button
          onClick={() => filterOnClick(0)}
          className={
            buttonShared +
            "rounded-l" +
            (filterSelected === 0 ? selectedShared : "")
          }
        >
          All
        </button>
        <button
          onClick={() => filterOnClick(1)}
          className={
            buttonShared +
            "border-l-0" +
            (filterSelected === 1 ? selectedShared : "")
          }
        >
          This Week
        </button>
        <button
          onClick={() => filterOnClick(2)}
          className={
            buttonShared +
            "rounded-r border-l-0" +
            (filterSelected === 2 ? selectedShared : "")
          }
        >
          This Month
        </button>
      </div>
    );
  };

  const getBugTable = (isDueSoon: boolean) => {
    const bugList = isDueSoon
      ? filterBugsByPage(dueSoonBugs, homeDueSoonPage)
      : filterBugsByPage(overdueBugs, homeOverduePage);
    return (
      <div className="mb-4 mt-4 min-h-[450px]">
        <table className="w-full">
          <thead>
            <tr className="bg-plain-light-500 text-left dark:bg-plain-dark-500">
              <th className="w-[40%] px-4">BUG</th>
              <th className="w-[40%] px-4">PROJECT</th>
              <th className="w-[20%] px-4">DUE DATE</th>
            </tr>
          </thead>
          <tbody>
            {bugList?.map((bug, idx) => {
              return (
                <tr
                  key={idx}
                  className="border-color-table-row-dl border-b hover:bg-plain-light-200 hover:dark:bg-plain-dark-300"
                >
                  <td
                    onClick={() => {}}
                    className="text-color-primary-dl cursor-pointer px-4 py-2 font-medium hover:underline"
                  >
                    {bug.name}
                  </td>
                  <td className="px-4 py-2">{bug.project}</td>
                  <td className={"px-4 py-2"}>
                    {bug.due_date !== null
                      ? moment.utc(bug.due_date).format("MM-DD-YYYY")
                      : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const { homeDueSoonPage, homeOverduePage } = useAppSelector(
    (state) => state.system,
  );

  // Shared classNames
  const bugTableContainerShared =
    " bg-color-foreground-dl flex flex-1 flex-col rounded p-6 shadow ";

  return (
    <div
      className={
        "mx-10 mb-10 mt-1 flex" +
        (props.isWideScreen ? " flex-grow" : " flex-col")
      }
    >
      <div
        className={
          bugTableContainerShared + (props.isWideScreen ? " mr-5" : "")
        }
      >
        {getTitleHeader("Bugs Due Soon")}
        {getFilterButtons(setHomeDueSoonFilterOption, true)}
        {getBugTable(true)}
        <TablePagingFooter
          isDueSoon={true}
          pageNum={homeDueSoonPage}
          numBugs={dueSoonBugs ? dueSoonBugs.length : 0}
        />
      </div>
      <div
        className={
          bugTableContainerShared + (props.isWideScreen ? " ml-5" : " mt-5")
        }
      >
        {getTitleHeader("Overdue Bugs")}
        {getFilterButtons(setHomeOverdueFilterOption, false)}
        {getBugTable(false)}
        <TablePagingFooter
          isDueSoon={false}
          pageNum={homeOverduePage}
          numBugs={overdueBugs ? overdueBugs.length : 0}
        />
      </div>
    </div>
  );
}

export default BugDueDatePanels;
