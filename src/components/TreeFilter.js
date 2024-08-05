import { useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTreeFilter } from "@/redux/reducers/uiSlice";
import styles from "./TreeFilter.module.css";
import Icon from "./Icon";
import ToggleButton from "./ToggleButton";

const TreeFilter = () => {
  const dispatch = useDispatch();
  const filter = useSelector((state) => state.ui.treeFilter);
  const allTasks = useSelector((state) => state.tasks.root.children);
  const filterPanelRef = useRef(null);

  useEffect(() => {
    const preventDefaultEvents = (e) => {
      if (e.type === "click") return; // 클릭은 허용
      e.preventDefault();
      e.stopPropagation();
    };

    const filterPanel = filterPanelRef.current;
    if (filterPanel) {
      filterPanel.addEventListener("contextmenu", preventDefaultEvents);
      filterPanel.addEventListener("dblclick", preventDefaultEvents);
      filterPanel.addEventListener("dragstart", preventDefaultEvents);
      filterPanel.addEventListener("mousedown", (e) => {
        if (e.detail > 1) {
          e.preventDefault(); // 더블클릭 방지
        }
      });
    }

    return () => {
      if (filterPanel) {
        filterPanel.removeEventListener("contextmenu", preventDefaultEvents);
        filterPanel.removeEventListener("dblclick", preventDefaultEvents);
        filterPanel.removeEventListener("dragstart", preventDefaultEvents);
        filterPanel.removeEventListener("mousedown", preventDefaultEvents);
      }
    };
  }, []);

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

  if (!filter) return <div>Loading...</div>;
  if (!allTasks) return <div>Loading...</div>;

  const toggleRootSelection = (rootId) => {
    const newSelectedRoots = filter.selectedRoots.includes(rootId)
      ? filter.selectedRoots.filter((id) => id !== rootId)
      : [...filter.selectedRoots, rootId];
    handleFilterChange("selectedRoots", newSelectedRoots);
  };

  const clearRootSelection = () => {
    handleFilterChange("selectedRoots", []);
  };

  const filteredRoots = allTasks.filter(isRootValid);

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
    <div className={styles.container}>
      {filter.isOpen && (
        <div className={styles.filterPanel} ref={filterPanelRef}>
          <div className={styles.header}>
            <h3 className={styles.title}>필터</h3>
            <div>
              <button onClick={refreshFilter} className={styles.refreshButton}>
                <Icon name="refresh" size={20} />
                <span className={styles.hintText}>필터 초기화 </span>
              </button>
            </div>
          </div>
          <div className={styles.searchWrapper}>
            <div className={styles.searchIcon}>
              <Icon name="search" size={20} />
            </div>
            <input
              type="text"
              className={styles.searchInput}
              value={filter.searchTerm}
              onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
              placeholder="검색어를 입력하세요"
            />
          </div>
          <div className={styles.section}>
            <label className={styles.label}>세부 할 일이 있을 때만 보기</label>
            <ToggleButton
              isOn={filter.showRootsWithChildren}
              onToggle={() =>
                handleFilterChange(
                  "showRootsWithChildren",
                  !filter.showRootsWithChildren
                )
              }
            />
          </div>
          <div className={styles.section}>
            <label className={styles.label}>완료된 할 일 보기</label>
            <ToggleButton
              isOn={filter.showCompletedTasks}
              onToggle={() =>
                handleFilterChange(
                  "showCompletedTasks",
                  !filter.showCompletedTasks
                )
              }
            />
          </div>
          <div className={styles.rootSelectSection}>
            <div className={styles.rootSelectHeader}>
              <label className={styles.label}>루트 선택</label>
              <button onClick={clearRootSelection} className={styles.button}>
                초기화
              </button>
            </div>
            <div className={styles.rootSelectSection}>
              <div className={styles.rootList}>
                {filteredRoots.map((task) => (
                  <div
                    key={task.id}
                    className={`${styles.rootItem} ${
                      filter.selectedRoots.includes(task.id)
                        ? styles.selected
                        : ""
                    }`}
                    onClick={() => toggleRootSelection(task.id)}
                  >
                    {task.name}
                    {filter.selectedRoots.includes(task.id) && (
                      <Icon name="check" size={20} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreeFilter;
