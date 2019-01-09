const { usersLabel } = require('./views');

describe('Slack Views', () => {
  it('UsersLabel should create for primary user', () => {
    const label = usersLabel([]);
    expect(label).toBe('you');
  })

  it('UsersLabel should create for primary user and another user', () => {
    const label = usersLabel(['@user1']);
    expect(label).toBe('you and @user1');
  })

  it('UsersLabel should create for primary user and 3 other user', () => {
    const label = usersLabel(['@user1', '@user2', '@user3']);
    expect(label).toBe('you, @user1, @user2 and @user3');
  })

  it('UsersLabel should create for primary user and 5 other user', () => {
    const label = usersLabel(['@user1', '@user2', '@user3', '@user4', '@user5']);
    expect(label).toBe('you, @user1, @user2, @user3, @user4 and @user5');
  })
})
