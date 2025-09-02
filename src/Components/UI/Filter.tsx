// this component is the filter bar which will be used in multiple components (contacts, tasks,schools, calendar, Projects)
// interface:
// - filters: array of filter objects to display
// - onFilterChange: function to handle filter change
// - searchQuery: string to display the current search query
// - onSearchChange: function to handle search query change
// - sortOptions: array of sort option objects to display
// - onSortChange: function to handle sort option change
// Example usage:
// <Filter
//   filters={filters}
//   onFilterChange={handleFilterChange}
//   searchQuery={searchQuery}
//   onSearchChange={handleSearchChange}
//   sortOptions={sortOptions}
//   onSortChange={handleSortChange}
// />
// it is a controlled component that receives the filter, search and sort options as props