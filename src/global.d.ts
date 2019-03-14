declare module NodeJS {
  interface Global {
    __gobridge__: any
    Go: any
  }
}
