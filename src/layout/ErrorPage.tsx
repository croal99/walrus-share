import {Link, redirect, useRouteError} from "react-router-dom";
import {Box, Button, Flex, Heading, Text} from "@radix-ui/themes";

export default function ErrorPage() {
    const error = useRouteError();
    console.error('error page', error);

    return (
        <>
            <Flex className="error-page" direction="column" gap="3">
                <Heading align="center" size="9">Oops!</Heading>
                <Heading size="7">Sorry, an unexpected error has occurred.</Heading>
                <Heading align="center" color="red">{error.data || error.message}</Heading>
                <Link to="/">Home</Link>

            </Flex>
        </>
    );
}