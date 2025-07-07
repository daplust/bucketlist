import { Flex, Spinner, Stack, Text } from "@chakra-ui/react";

import BucketListItem from "./BucketListItem";
import { useQuery } from "@tanstack/react-query";
import BASE_URL from "../App";

export type Bucket = {
	_id: number;
	desc: string;
	completed: boolean;
};

const BucketList = () => {
	const { data: bucketlists, isLoading } = useQuery<Bucket[]>({
		queryKey: ["bucketlists"],
		queryFn: async () => {
			try {
				const res = await fetch("http://localhost:4000/api");
				const data = await res.json();

				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				return data || [];
			} catch (error) {
				console.log(error);
			}
		},
	});

	return (
		<>
			<Text
				fontSize={"4xl"}
				textTransform={"uppercase"}
				fontWeight={"bold"}
				textAlign={"center"}
				my={2}
				bgGradient='linear(to-l, #0b85f8, #00ffff)'
				bgClip='text'
			>
				Today's Tasks
			</Text>
			{isLoading && (
				<Flex justifyContent={"center"} my={4}>
					<Spinner size={"xl"} />
				</Flex>
			)}
			{!isLoading && bucketlists?.length === 0 && (
				<Stack alignItems={"center"} gap='3'>
					<Text fontSize={"xl"} textAlign={"center"} color={"gray.500"}>
						All tasks completed! 🤞
					</Text>
					<img src='/go.png' alt='Go logo' width={70} height={70} />
				</Stack>
			)}
			<Stack gap={3}>
				{bucketlists?.map((bucket) => (
					<BucketListItem key={bucket._id} bucketListItem={bucket} />
				))}
			</Stack>
		</>
	);
};
export default BucketList;

// STARTER CODE:

// import { Flex, Spinner, Stack, Text } from "@chakra-ui/react";
// import { useState } from "react";
// import TodoItem from "./TodoItem";

// const TodoList = () => {
// 	const [isLoading, setIsLoading] = useState(true);
// 	const todos = [
// 		{
// 			_id: 1,
// 			body: "Buy groceries",
// 			completed: true,
// 		},
// 		{
// 			_id: 2,
// 			body: "Walk the dog",
// 			completed: false,
// 		},
// 		{
// 			_id: 3,
// 			body: "Do laundry",
// 			completed: false,
// 		},
// 		{
// 			_id: 4,
// 			body: "Cook dinner",
// 			completed: true,
// 		},
// 	];
// 	return (
// 		<>
// 			<Text fontSize={"4xl"} textTransform={"uppercase"} fontWeight={"bold"} textAlign={"center"} my={2}>
// 				Today's Tasks
// 			</Text>
// 			{isLoading && (
// 				<Flex justifyContent={"center"} my={4}>
// 					<Spinner size={"xl"} />
// 				</Flex>
// 			)}
// 			{!isLoading && todos?.length === 0 && (
// 				<Stack alignItems={"center"} gap='3'>
// 					<Text fontSize={"xl"} textAlign={"center"} color={"gray.500"}>
// 						All tasks completed! 🤞
// 					</Text>
// 					<img src='/go.png' alt='Go logo' width={70} height={70} />
// 				</Stack>
// 			)}
// 			<Stack gap={3}>
// 				{todos?.map((todo) => (
// 					<TodoItem key={todo._id} todo={todo} />
// 				))}
// 			</Stack>
// 		</>
// 	);
// };
// export default TodoList;