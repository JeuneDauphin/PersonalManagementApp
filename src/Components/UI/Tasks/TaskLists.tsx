// this component is a list of tasks, it will display a list of TaskCard components as a grid layout
// it will receive an array of task objects as props and map through them to render each TaskCard component
// the component will also handle loading states and empty states
// Props:
// - tasks: array of task objects to be displayed
// - isLoading: boolean to indicate if the data is still loading
// - onTaskClick: function to handle click events on individual task cards
// Example usage:
// <TaskLists tasks={tasks} isLoading={isLoading} onTaskClick={handleTaskClick} />
// it is a controlled component that receives the list of tasks as props
