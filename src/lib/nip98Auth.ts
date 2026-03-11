interface SignableUser {
  signer: {
    signEvent: (event: {
      kind: number;
      content: string;
      tags: string[][];
      created_at: number;
    }) => Promise<unknown>;
  };
}

export async function createNip98Token(
  user: SignableUser,
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
): Promise<string> {
  const authEvent = await user.signer.signEvent({
    kind: 27235,
    content: '',
    tags: [
      ['u', url],
      ['method', method],
    ],
    created_at: Math.floor(Date.now() / 1000),
  });

  return btoa(JSON.stringify(authEvent));
}
