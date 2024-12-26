export interface IRegistrable<T = void> {
  register: () => Promise<T> | T
}
