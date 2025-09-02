// this component is used to display a list of tests 
// it will receive an array of test objects as props and map through them to render each TestCard component
// the component will also handle loading states and empty states
// interface:
// - tests: array of test objects to be displayed
// - isLoading: boolean to indicate if the data is still loading
// - onTestClick: function to handle click events on individual test cards
// Example usage:
// <TestLists tests={tests} isLoading={isLoading} onTestClick={handleTestClick} />
