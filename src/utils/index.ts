export const keyGenerate = (length = 16) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let secretPhrase = '';
  
    for (let i = 0; i < length; i++) {
      secretPhrase += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  
    return secretPhrase;
};

export const delay = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}