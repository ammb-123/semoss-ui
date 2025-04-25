import { useEffect, useState } from "react";

type OSPlatform = "Windows" | "MacOS" | "Linux" | "Unknown OS";

export const usePlatform = () => {
	const [os, setOS] = useState<OSPlatform>("Unknown OS");

	useEffect(() => {
		const userAgent = navigator.userAgent;

		let osName: OSPlatform = "Unknown OS";
		if (userAgent.includes("Win")) {
			osName = "Windows";
		} else if (userAgent.includes("Mac")) {
			osName = "MacOS";
		} else if (userAgent.includes("Linux")) {
			osName = "Linux";
		}
		setOS(osName);
	}, []);

	return os;
};
