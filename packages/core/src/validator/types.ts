export interface ValidationError {
  type:
    | 'heading_count'
    | 'code_block_count'
    | 'link_count'
    | 'list_item_count'
    | 'image_count'
    | 'residual_placeholder'
    | 'parse_failure';
  expected: number | string;
  actual: number | string;
  detail: string;
}

export interface ValidationResult {
  passed: boolean;
  errors: ValidationError[];
}
