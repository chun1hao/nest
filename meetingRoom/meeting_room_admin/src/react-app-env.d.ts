declare module "*.module.less" {
  const classes: {
    readonly [key: string]: string;
  };
  export default classes;
  declare module "*.less";
}

declare module "*.module.css" {
  const classes: {
    readonly [key: string]: string;
  };
  export default classes;
  declare module "*.css";
}
