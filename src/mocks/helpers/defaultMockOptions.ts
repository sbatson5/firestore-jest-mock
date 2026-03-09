export interface MockOptions {
  includeIdsInData: boolean;
  mutable: boolean;
  simulateQueryFilters: boolean;
}

const defaultMockOptions: MockOptions = {
  includeIdsInData: false,
  mutable: false,
  simulateQueryFilters: false,
};

export default defaultMockOptions;
