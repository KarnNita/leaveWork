import { LoaderFunction, redirect } from "@remix-run/node";


export let loader: LoaderFunction = async () => {
    return redirect('/leaveHome')
}
export default function Index() {
    return null;
}