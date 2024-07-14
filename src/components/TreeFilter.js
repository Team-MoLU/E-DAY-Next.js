import React, { useState } from "react";

const TreeFilter = () => {
  //const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {
        <div className="fixed right-5 bg-slate-300 rounded-md shadow-lg p-4 w-48 z-50">
          <div className="flex justify-center items-center mb-4">
            <h3 className="text-lg font-bold">필터</h3>
          </div>
        </div>
      }
    </div>
  );
};

export default TreeFilter;
