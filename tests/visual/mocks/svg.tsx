import React, { type ComponentProps, type ReactNode } from "react";
type Props = ComponentProps<"svg"> & { accessible?: boolean };
export default function Svg({ accessible, ...props }: Props) {
  return <svg aria-hidden={!accessible} {...props} />;
}
type ShapeProps = {
  children?: ReactNode;
  rotation?: number;
  origin?: string;
  [key: string]: unknown;
};
function shape(
  tag: string,
  { rotation, origin, children, ...props }: ShapeProps,
) {
  if (rotation)
    props.transform = `rotate(${rotation} ${origin?.replace(",", " ") ?? "0 0"})`;
  return React.createElement(tag, props, children);
}
export const Circle = (p: ShapeProps) => shape("circle", p);
export const Ellipse = (p: ShapeProps) => shape("ellipse", p);
export const G = (p: ShapeProps) => shape("g", p);
export const Path = (p: ShapeProps) => shape("path", p);
export const Rect = (p: ShapeProps) => shape("rect", p);
export const Line = (p: ShapeProps) => shape("line", p);
