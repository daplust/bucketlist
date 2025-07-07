package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type BucketList struct {
	ID        primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	Completed bool               `json:"completed"`
	Desc      string             `json:"desc"`
}

var collection *mongo.Collection

func main() {
	// var myName string = "Devita"
	// const myLastName = "Azka"

	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("Error loading .env file: ", err)
	}

	PORT := os.Getenv("PORT")
	DB_URI := os.Getenv("DATABASE_URL")
	if DB_URI == "" {
		log.Fatal("DATABASE_URL is not set")
	}
	clientOpt := options.Client().ApplyURI(DB_URI)
	client, err := mongo.Connect(context.Background(), clientOpt)
	if err != nil {
		log.Fatal("Error connecting to MongoDB: ", err)
	}

	defer client.Disconnect(context.Background())

	err = client.Ping(context.Background(), nil)
	if err != nil {
		log.Fatal("Error pinging: ", err)
	}
	fmt.Println("Connected to MongoDB successfully")
	collection = client.Database("BucketList").Collection("bucketlists")
	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:5173",
		AllowHeaders: "Origin, Content-Type, Accept",
		AllowMethods: "GET, POST, PUT, DELETE",
	}))
	// Define routes
	app.Get("/api", getAllBucketLists)
	app.Post("/api/newBucketList", createBucketList)
	app.Put("/api/bucketlist/update/:id", updateBucketList)
	app.Put("/api/bucketlist/completed/:id", completedBucketList)
	app.Delete("/api/bucketlist/delete/:id", deleteBucketList)

	//api

	// app.Get("/", func(c *fiber.Ctx) error {
	// 	return c.Status(200).JSON(fiber.Map{"msg": "get success"})
	// })
	// app.Get("/GetAll", func(c *fiber.Ctx) error {
	// 	return c.Status(200).JSON(todos)
	// })
	// app.Post("/api/newTodo", func(c *fiber.Ctx) error {
	// 	todo := &Todo{}
	// 	if err := c.BodyParser(todo); err != nil {
	// 		return err
	// 	}
	// 	if todo.Desc == "" {
	// 		return c.Status(400).JSON(fiber.Map{"msg": "description cannot be empty"})
	// 	}
	// 	todo.ID = len(todos) + 1
	// 	todos = append(todos, *todo)
	// 	return c.Status(201).JSON(todo)
	// })

	// app.Put("/api/todo/Update/:id", func(c *fiber.Ctx) error {
	// 	id := c.Params("id")

	// 	for i, todo := range todos {
	// 		if fmt.Sprint(todo.ID) == id {
	// 			todos[i].Completed = true
	// 			return c.Status(200).JSON(todos[i])
	// 		}
	// 	}
	// 	return c.Status(404).JSON(fiber.Map{"error": "task not found"})
	// })

	// app.Delete("/api/todo/Delete/:id", func(c *fiber.Ctx) error {
	// 	id := c.Params("id")

	// 	for i, todo := range todos {
	// 		if fmt.Sprint(todo.ID) == id {
	// 			todos = append(todos[:i], todos[i+1:]...)
	// 			return c.Status(204).JSON(fiber.Map{"msg": "task deleted successfully"})
	// 		}
	// 	}
	// 	return c.Status(404).JSON(fiber.Map{"error": "task not found"})
	// })
	log.Fatal(app.Listen("0.0.0.0:" + PORT))
}

func getAllBucketLists(c *fiber.Ctx) error {
	cursor, err := collection.Find(context.Background(), bson.M{})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch bucket lists"})
	}
	defer cursor.Close(context.Background())

	var bucketLists []BucketList
	if err = cursor.All(context.Background(), &bucketLists); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to decode bucket lists"})
	}

	return c.Status(200).JSON(bucketLists)
}

func createBucketList(c *fiber.Ctx) error {
	bucketList := new(BucketList)
	if err := c.BodyParser(bucketList); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	if bucketList.Desc == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Description cannot be empty"})
	}

	result, err := collection.InsertOne(context.Background(), bucketList)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create bucket list"})
	}

	bucketList.ID = result.InsertedID.(primitive.ObjectID)
	return c.Status(201).JSON(bucketList)
}
func updateBucketList(c *fiber.Ctx) error {
	id := c.Params("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid ID"})
	}

	bucketList := new(BucketList)
	if err := c.BodyParser(bucketList); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	filter := bson.M{"_id": objID}
	update := bson.M{"$set": bucketList}

	result, err := collection.UpdateOne(context.Background(), filter, update)
	if err != nil || result.MatchedCount == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Bucket list not found"})
	}

	return c.Status(200).JSON(bucketList)
}
func completedBucketList(c *fiber.Ctx) error {
	id := c.Params("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid ID"})
	}

	filter := bson.M{"_id": objID}
	update := bson.M{"$set": bson.M{"completed": true}}

	result, err := collection.UpdateOne(context.Background(), filter, update)
	if err != nil || result.MatchedCount == 0 {
		return c.Status(404).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(200).JSON(fiber.Map{"success": "Bucket list marked as completed"})
}
func deleteBucketList(c *fiber.Ctx) error {
	id := c.Params("id")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid ID"})
	}

	filter := bson.M{"_id": objID}
	result, err := collection.DeleteOne(context.Background(), filter)
	if err != nil || result.DeletedCount == 0 {
		return c.Status(404).JSON(fiber.Map{"error": "Bucket list not found"})
	}

	return c.Status(200).JSON(fiber.Map{"success": "Bucket list deleted successfully"})
}
