export const fieldType = {
  ["Work Item Type"]: {
    operators: ["equals", "contains", "does not contain"],
    values: ["Backlog", "Bug", "Task"],
  },
  ["Team"]: {
    operators: ["include", "exclude"],
    values: ["Team A", "Team B", "Team C"],
  },
  ["Created By"]: {
    operators: ["include", "exclude"],
    values: ["User A", "User B", "User C"],
  },
  ["Tags"]: {
    operators: ["include", "exclude"],
    values: ["UI", "DSP", "ADFR", "DB"],
  },
  ["State"]: {
    operators: ["equals", "contains", "does not contain"],
    values: ["New", "In progress", "Done"],
  },
  ["ID"]: {
    operators: ["equals", "Starts With", "Ends With"],
    values: [111, 222, 333],
  },
};


const checkConstrainsWithLocalStorage = (res) => {
  if (
    localStorage.getItem("query").includes("ID") ||
    (localStorage.getItem("query").includes("Created by") &&
      !localStorage.getItem("query").includes("Team"))
  ) {
    const index = res.indexOf("Team");
    if (index > -1) {
      res.splice(index, 1);
    }
  }
  if (
    localStorage.getItem("query").includes("Backlog") &&
    !localStorage.getItem("query").includes("ID")
  ) {
    res.push("ID");
  }
  if (
    localStorage.getItem("query").includes("Bug") &&
    !localStorage.getItem("query").includes("State")
  ) {
    res.push("State");
  }

  return res;
};

export const getAbsentValues = (arr1, arr2, local = true) => {
  let res = [];
  res = arr1.filter((el) => {
    return !arr2.find((obj) => {
      return el === obj.field;
    });
  });
  if (local) {
    checkConstrainsWithLocalStorage(res);
  }
  return res;
};
