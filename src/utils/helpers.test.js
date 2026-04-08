import { makeGroupMatches, resolveWinner } from './helpers.js';

describe('resolveWinner', () => {
  test('should return team 1 when team 1 scores more goals', () => {
    expect(resolveWinner('Team A', 'Team B', 2, 1)).toBe('Team A');
    expect(resolveWinner('Team A', 'Team B', '2', '1')).toBe('Team A'); // String inputs
  });

  test('should return team 2 when team 2 scores more goals', () => {
    expect(resolveWinner('Team A', 'Team B', 1, 2)).toBe('Team B');
    expect(resolveWinner('Team A', 'Team B', '1', '2')).toBe('Team B'); // String inputs
  });

  test('should return team 1 when goals are tied and team 1 scores more penalties', () => {
    expect(resolveWinner('Team A', 'Team B', 1, 1, 5, 4)).toBe('Team A');
    expect(resolveWinner('Team A', 'Team B', '1', '1', '5', '4')).toBe('Team A'); // String inputs
  });

  test('should return team 2 when goals are tied and team 2 scores more penalties', () => {
    expect(resolveWinner('Team A', 'Team B', 2, 2, 3, 4)).toBe('Team B');
    expect(resolveWinner('Team A', 'Team B', '2', '2', '3', '4')).toBe('Team B'); // String inputs
  });
});

describe('makeGroupMatches', () => {
  test('should return official round-robin order for 4 teams', () => {
    const teams = ['Team A', 'Team B', 'Team C', 'Team D'];
    const matches = makeGroupMatches(teams);

    expect(matches).toHaveLength(6);
    expect(matches[0]).toMatchObject({ t1: 'Team A', t2: 'Team B' });
    expect(matches[1]).toMatchObject({ t1: 'Team C', t2: 'Team D' });
    expect(matches[2]).toMatchObject({ t1: 'Team A', t2: 'Team C' });
    expect(matches[3]).toMatchObject({ t1: 'Team B', t2: 'Team D' });
    expect(matches[4]).toMatchObject({ t1: 'Team A', t2: 'Team D' });
    expect(matches[5]).toMatchObject({ t1: 'Team B', t2: 'Team C' });
  });

  test('should return empty array for 0 teams', () => {
    const teams = [];
    const matches = makeGroupMatches(teams);
    expect(matches).toHaveLength(0);
  });

  test('should return empty array for 1 team', () => {
    const teams = ['Team A'];
    const matches = makeGroupMatches(teams);
    expect(matches).toHaveLength(0);
  });

  test('should return 1 match for 2 teams', () => {
    const teams = ['Team A', 'Team B'];
    const matches = makeGroupMatches(teams);
    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatchObject({ t1: 'Team A', t2: 'Team B' });
  });

  test('should return 3 matches for 3 teams', () => {
    const teams = ['Team A', 'Team B', 'Team C'];
    const matches = makeGroupMatches(teams);
    expect(matches).toHaveLength(3);
    // order for fallback: (0,1), (0,2), (1,2)
    expect(matches[0]).toMatchObject({ t1: 'Team A', t2: 'Team B' });
    expect(matches[1]).toMatchObject({ t1: 'Team A', t2: 'Team C' });
    expect(matches[2]).toMatchObject({ t1: 'Team B', t2: 'Team C' });
  });

  test('should return 10 matches for 5 teams (fallback)', () => {
    const teams = ['T1', 'T2', 'T3', 'T4', 'T5'];
    const matches = makeGroupMatches(teams);
    expect(matches).toHaveLength(10);
  });
});
