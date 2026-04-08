import { makeGroupMatches, emptyMatch, completedMatch } from './helpers.js';

describe('emptyMatch', () => {
  test('should return correct match structure when provided with two teams', () => {
    const match = emptyMatch('Team A', 'Team B');
    expect(match).toEqual({
      t1: 'Team A',
      t2: 'Team B',
      g1: '',
      g2: '',
      p1: '',
      p2: '',
      confirmed: false,
      winner: null
    });
  });

  test('should default missing teams to empty strings', () => {
    const matchNoArgs = emptyMatch();
    expect(matchNoArgs.t1).toBe('');
    expect(matchNoArgs.t2).toBe('');

    const matchOneArg = emptyMatch('Team A');
    expect(matchOneArg.t1).toBe('Team A');
    expect(matchOneArg.t2).toBe('');
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

describe('completedMatch', () => {
  test('should correctly identify winner when Team 1 wins without penalties', () => {
    const match = completedMatch('Team A', 'Team B', 2, 1);
    expect(match).toMatchObject({
      t1: 'Team A', t2: 'Team B', g1: '2', g2: '1', p1: '', p2: '', confirmed: true, winner: 'Team A'
    });
  });

  test('should correctly identify winner when Team 2 wins without penalties', () => {
    const match = completedMatch('Team A', 'Team B', 0, 3);
    expect(match).toMatchObject({
      t1: 'Team A', t2: 'Team B', g1: '0', g2: '3', p1: '', p2: '', confirmed: true, winner: 'Team B'
    });
  });

  test('should correctly identify winner when Team 1 wins on penalties', () => {
    const match = completedMatch('Team A', 'Team B', 1, 1, 5, 4);
    expect(match).toMatchObject({
      t1: 'Team A', t2: 'Team B', g1: '1', g2: '1', p1: '5', p2: '4', confirmed: true, winner: 'Team A'
    });
  });

  test('should correctly identify winner when Team 2 wins on penalties', () => {
    const match = completedMatch('Team A', 'Team B', 2, 2, 3, 4);
    expect(match).toMatchObject({
      t1: 'Team A', t2: 'Team B', g1: '2', g2: '2', p1: '3', p2: '4', confirmed: true, winner: 'Team B'
    });
  });

  test('should convert goals and penalties arguments to strings', () => {
    const match = completedMatch('Team A', 'Team B', 1, 2, 0, 0);
    expect(typeof match.g1).toBe('string');
    expect(typeof match.g2).toBe('string');
    expect(typeof match.p1).toBe('string');
    expect(typeof match.p2).toBe('string');
  });
});
