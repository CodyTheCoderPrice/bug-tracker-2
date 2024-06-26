import { ChangeEventHandler } from "react";

type TProps = {
  type: string;
  name: string;
  placeholder: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  value: string;
  autoComplete?: string;
  hasError: boolean;
  className?: string;
};

function InputField(props: TProps) {
  return (
    <input
      type={props.type}
      name={props.name}
      placeholder={props.placeholder}
      onChange={props.onChange}
      value={props.value}
      autoComplete={props.autoComplete ? props.autoComplete : "on"}
      className={
        "mt-6 block w-full rounded border border-solid p-2 focus:outline focus:outline-1 " +
        props.className +
        (props.hasError
          ? " border-warning-red-light focus:outline-warning-red-light"
          : " border-gray-400 focus:outline-blue-500")
      }
    />
  );
}

export default InputField;
