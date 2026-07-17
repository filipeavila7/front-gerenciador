import { useEffect } from "react";

const scrollPositions: Record<string, number> = {};

export function useScrollPosition(page: string) {

    useEffect(() => {

        const pageScrollPosition = scrollPositions[page];


        if (pageScrollPosition) {

            setTimeout(() => {

                window.scrollTo(
                    0,
                    pageScrollPosition
                );

                console.log(
                    "restaurando:",
                    pageScrollPosition
                );

            }, 50);

        }


        function save() {

            scrollPositions[page] = window.scrollY;

            console.log(
                "salvando:",
                scrollPositions[page]
            );

        }


        window.addEventListener(
            "scroll",
            save
        );


        return () => {

            window.removeEventListener(
                "scroll",
                save
            );

        };


    }, [page]);

}