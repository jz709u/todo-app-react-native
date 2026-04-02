export default interface Todo {
  id: string;
  isCompleted: boolean;
  text: string;
  updatedAt?: number; // timestamp for conflict resolution
}
