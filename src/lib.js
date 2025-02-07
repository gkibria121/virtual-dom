function view() {
  return <div>hi there</div>;
}

console.log(view());

function h(type, props, children) {
  return {
    tyep: type,
    props: props,
    children: Array.isArray(children) ? children : [children],
  };
}
