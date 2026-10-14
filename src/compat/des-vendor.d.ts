declare module "des.js" {
  interface DesInstance {
    update(bytes: number[]): number[];
    final(): number[];
  }
  const des: {
    DES: {
      create(options: { type: "encrypt" | "decrypt"; key: number[]; padding: false }): DesInstance;
    };
  };
  export default des;
}
