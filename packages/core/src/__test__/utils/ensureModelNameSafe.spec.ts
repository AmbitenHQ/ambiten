import { ensureModelNameSafe } from "../../utils";


describe('ensureModelNameSafe', () => {
  it('returns the trimmed model name if valid', () => {
    expect(ensureModelNameSafe('  Users  ')).toBe('Users');
  });

  it('throws if model name is empty', () => {
    expect(() => ensureModelNameSafe('')).toThrow('Model name must be a non-empty string');
  });

  it('throws if model name is only whitespace', () => {
    expect(() => ensureModelNameSafe('   ')).toThrow('Model name cannot be just whitespace');
  });

  it('throws if model name contains invalid characters', () => {
    expect(() => ensureModelNameSafe('user$%^')).toThrow(
      'Model name must only contain letters, numbers, and underscores'
    );
  });

  it('throws if model name is not a string', () => {
    // @ts-expect-error testing bad input
    expect(() => ensureModelNameSafe(null)).toThrow('Model name must be a non-empty string');
  });
});
