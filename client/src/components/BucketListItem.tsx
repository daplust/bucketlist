import { Badge, Box, Flex, Spinner, Text } from "@chakra-ui/react";
import { FaCheckCircle } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import type { Bucket } from "./BucketList";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import BASE_URL from "../App";

const BucketListItem = ({ bucketListItem }: { bucketListItem: Bucket }) => {
	const queryClient = useQueryClient();

	const { mutate: updateBucketListItem, isPending: isUpdating } = useMutation({
		mutationKey: ["updateBucketListItem"],
		mutationFn: async () => {
			if (bucketListItem.completed) return alert("Bucket List Item is already completed");
			try {
				const res = await fetch(BASE_URL + `/bucket-list/${bucketListItem._id}`, {
					method: "PATCH",
				});
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				return data;
			} catch (error) {
				console.log(error);
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["todos"] });
		},
	});

	const { mutate: deleteBucketListItem, isPending: isDeleting } = useMutation({
		mutationKey: ["deleteBucketListItem"],
		mutationFn: async () => {
			try {
				const res = await fetch(BASE_URL + `/todos/${bucketListItem._id}`, {
					method: "DELETE",
				});
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				return data;
			} catch (error) {
				console.log(error);
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["bucketlists"] });
		},
	});

	return (
		<Flex gap={2} alignItems={"center"}>
			<Flex
				flex={1}
				alignItems={"center"}
				border={"1px"}
				borderColor={"gray.600"}
				p={2}
				borderRadius={"lg"}
				justifyContent={"space-between"}
			>
				<Text
					color={bucketListItem.completed ? "green.200" : "yellow.100"}
					textDecoration={bucketListItem.completed ? "line-through" : "none"}
				>
					{bucketListItem.desc}
				</Text>
				{bucketListItem.completed && (
					<Badge ml='1' colorScheme='green'>
						Done
					</Badge>
				)}
				{!bucketListItem.completed && (
					<Badge ml='1' colorScheme='yellow'>
						In Progress
					</Badge>
				)}
			</Flex>
			<Flex gap={2} alignItems={"center"}>
				<Box color={"green.500"} cursor={"pointer"} onClick={() => updateBucketListItem()}>
					{!isUpdating && <FaCheckCircle size={20} />}
					{isUpdating && <Spinner size={"sm"} />}
				</Box>
				<Box color={"red.500"} cursor={"pointer"} onClick={() => deleteBucketListItem()}>
					{!isDeleting && <MdDelete size={25} />}
					{isDeleting && <Spinner size={"sm"} />}
				</Box>
			</Flex>
		</Flex>
	);
};
export default BucketListItem;

// STARTER CODE:

// import { Badge, Box, Flex, Text } from "@chakra-ui/react";
// import { FaCheckCircle } from "react-icons/fa";
// import { MdDelete } from "react-icons/md";

// const TodoItem = ({ todo }: { todo: any }) => {
// 	return (
// 		<Flex gap={2} alignItems={"center"}>
// 			<Flex
// 				flex={1}
// 				alignItems={"center"}
// 				border={"1px"}
// 				borderColor={"gray.600"}
// 				p={2}
// 				borderRadius={"lg"}
// 				justifyContent={"space-between"}
// 			>
// 				<Text
// 					color={todo.completed ? "green.200" : "yellow.100"}
// 					textDecoration={todo.completed ? "line-through" : "none"}
// 				>
// 					{todo.body}
// 				</Text>
// 				{todo.completed && (
// 					<Badge ml='1' colorScheme='green'>
// 						Done
// 					</Badge>
// 				)}
// 				{!todo.completed && (
// 					<Badge ml='1' colorScheme='yellow'>
// 						In Progress
// 					</Badge>
// 				)}
// 			</Flex>
// 			<Flex gap={2} alignItems={"center"}>
// 				<Box color={"green.500"} cursor={"pointer"}>
// 					<FaCheckCircle size={20} />
// 				</Box>
// 				<Box color={"red.500"} cursor={"pointer"}>
// 					<MdDelete size={25} />
// 				</Box>
// 			</Flex>
// 		</Flex>
// 	);
// };
// export default TodoItem;