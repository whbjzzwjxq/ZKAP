import toast, { Toaster } from "react-hot-toast";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function fancyToast({ text, id }: { text: string | JSX.Element; id: string }) {
  const options = {
    duration: Infinity,
    style: { fontFamily: "GroteskRegular", backgroundColor: "#675e71", color: "white", padding: "4px" },
    position: "bottom-right",
  };
  if (id) {
    // @ts-ignore
    options["id"] = id;
  }
  toast(
    (t) => (
      <div className="flex">
        <div className="justify-center items-center">
          <button
            type="button"
            className="flex justify-center items-center rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={() => toast.dismiss(t.id)}
            style={{ height: "100%" }}
          >
            <div className="justify-center items-center">
              <XMarkIcon className="h-5 w-5 mr-2" aria-hidden="true" />
            </div>

            {/* <span className="sr-only">Close</span>
            <div className="flex">
              <div className="justify-center items-center"></div>
            </div> */}
          </button>
        </div>
        <div className="justify-center">{text}</div>
      </div>
    ),
    // @ts-ignore
    {
      ...options,
    }
  );
}
