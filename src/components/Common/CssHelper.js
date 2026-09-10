export function swapDocBody(classes = []) {
  document.body.classList.add(...classes);
  document.documentElement.classList.add(...classes);
  document.getElementById("root")?.classList.add(...classes);

  return () => {
    document.body.classList.remove(...classes);
    document.documentElement.classList.remove(...classes);
    document.getElementById("root")?.classList.remove(...classes);
  };
}