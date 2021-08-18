import React from "react";
import Search from "react-feather/dist/icons/search";

interface ComponentFilterProps {
  onChange: (pattern: string) => void;
  value: string;
}

const ComponentFilter = ({ onChange, value }: ComponentFilterProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="search-components">
      <Search />
      <input
        type="text"
        placeholder="Filter components"
        onChange={handleChange}
        value={value}
      />
    </div>
  );
};

export default ComponentFilter;