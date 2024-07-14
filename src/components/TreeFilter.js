import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTreeFilter } from "@/redux/reducers/uiSlice";

const TreeFilter = () => {
  const dispatch = useDispatch();
  const filter = useSelector((state) => state.ui.treeFilter);
  const allTasks = useSelector((state) => state.tasks.root.children);
  const [isOpen, setIsOpen] = useState(true);

  const handleFilterChange = (filterType, value) => {
    dispatch(setTreeFilter({ ...filter, [filterType]: value }));
  };

  const allChildrenCompleted = (node) => {
    if (!node.children || node.children.length === 0) {
      return true;
    }
    return node.children.every(
      (child) => child.check && allChildrenCompleted(child)
    );
  };

  const isRootValid = (root) => {
    if (
      filter.showRootsWithChildren &&
      (!root.children || root.children.length === 0)
    ) {
      return false;
    }
    if (
      !filter.showCompletedTasks &&
      root.check &&
      allChildrenCompleted(root)
    ) {
      return false;
    }
    return true;
  };

  const handleRootSelection = (event) => {
    const selectedOptions = Array.from(
      event.target.selectedOptions,
      (option) => option.value
    );
    const validSelectedRoots = selectedOptions.filter((rootId) =>
      isRootValid(allTasks.find((task) => task.id === rootId))
    );
    handleFilterChange("selectedRoots", validSelectedRoots);
  };

  const clearRootSelection = () => {
    handleFilterChange("selectedRoots", []);
  };

  const filteredRoots = allTasks.filter(isRootValid);

  const toggleFilter = () => {
    setIsOpen(!isOpen);
  };

  const refreshFilter = () => {
    dispatch(
      setTreeFilter({
        searchTerm: "",
        selectedRoots: [],
        showRootsWithChildren: true,
        showCompletedTasks: false,
      })
    );
  };

  return (
    <div className="relative">
      {isOpen ? (
        <div className="fixed right-5 bg-slate-300 rounded-md shadow-lg p-4 w-64 z-50 transition-all duration-300 ease-in-out">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">필터</h3>
            <div>
              <button
                onClick={refreshFilter}
                className="mr-2 p-1 bg-blue-500 text-white rounded"
              >
                🔄
              </button>
              <button
                onClick={toggleFilter}
                className="p-1 bg-red-500 text-white rounded"
              >
                ✕
              </button>
            </div>
          </div>
          {/* Rest of the filter content */}
          <div className="mb-4">
            <label className="block mb-2 font-semibold">검색</label>
            <input
              type="text"
              className="w-full p-2 rounded"
              value={filter.searchTerm}
              onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
              placeholder="검색어 입력..."
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-semibold">
              선택한 루트만 보기
            </label>
            <select
              multiple
              className="w-full p-2 rounded"
              value={filter.selectedRoots}
              onChange={handleRootSelection}
              size={5}
            >
              {filteredRoots.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.name}
                </option>
              ))}
            </select>
            <button
              onClick={clearRootSelection}
              className="mt-2 bg-blue-500 text-white px-2 py-1 rounded"
            >
              초기화
            </button>
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-semibold">루트 할 일</label>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showRootsWithChildren"
                checked={filter.showRootsWithChildren}
                onChange={(e) =>
                  handleFilterChange("showRootsWithChildren", e.target.checked)
                }
              />
              <label htmlFor="showRootsWithChildren" className="ml-2">
                세부 할 일이 있을 때만 보기
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showCompletedTasks"
                checked={filter.showCompletedTasks}
                onChange={(e) =>
                  handleFilterChange("showCompletedTasks", e.target.checked)
                }
              />
              <label htmlFor="showCompletedTasks" className="ml-2">
                완료된 할 일 보기
              </label>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={toggleFilter}
          className="fixed right-5 top-5 bg-blue-500 text-white px-4 py-2 rounded shadow-lg z-50 transition-all duration-300 ease-in-out"
        >
          필터
        </button>
      )}
    </div>
  );
};

export default TreeFilter;
