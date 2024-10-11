const AWS = require('aws-sdk');

// 配置 AWS 区域和凭证
AWS.config.update({
    region: 'us-east-1', // 替换为你的区域
    // accessKeyId: 'AKIA4SYAMJJC5Q2WBHPZ',
    // secretAccessKey: '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'
});

const dynamodb = new AWS.DynamoDB();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

// 创建表
const createTable = async () => {
    const params = {
        TableName: 'Users',
        KeySchema: [
            { AttributeName: 'UserId', KeyType: 'HASH' }
        ],
        AttributeDefinitions: [
            { AttributeName: 'UserId', AttributeType: 'S' }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    };

    try {
        await dynamodb.createTable(params).promise();
        console.log("Table created.");
    } catch (err) {
        console.error("Unable to create table:", JSON.stringify(err, null, 2));
    }
};

// 添加项目
const putItem = async () => {
    const params = {
        TableName: 'Users',
        Item: {
            UserId: '1',
            Name: 'John Doe',
            Age: 30
        }
    };

    try {
        await dynamoDB.put(params).promise();
        console.log("Item added:", params.Item);
    } catch (err) {
        console.error("Unable to add item:", JSON.stringify(err, null, 2));
    }
};

// 读取项目
const getItem = async () => {
    const params = {
        TableName: 'Users',
        Key: {
            UserId: '1'
        }
    };

    try {
        const data = await dynamoDB.get(params).promise();
        console.log("Get item succeeded:", JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Unable to read item:", JSON.stringify(err, null, 2));
    }
};

// 更新项目
const updateItem = async () => {
    const params = {
        TableName: 'Users',
        Key: {
            UserId: '1'
        },
        UpdateExpression: 'set Age = :a',
        ExpressionAttributeValues: {
            ':a': 31
        },
        ReturnValues: 'UPDATED_NEW'
    };

    try {
        const data = await dynamoDB.update(params).promise();
        console.log("Update item succeeded:", JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Unable to update item:", JSON.stringify(err, null, 2));
    }
};

// 删除项目
const deleteItem = async () => {
    const params = {
        TableName: 'Users',
        Key: {
            UserId: '1'
        }
    };

    try {
        await dynamoDB.delete(params).promise();
        console.log("Delete item succeeded:", params.Key);
    } catch (err) {
        console.error("Unable to delete item:", JSON.stringify(err, null, 2));
    }
};

// 执行示例
const run = async () => {
    await createTable(); // 创建表
    await putItem();     // 添加项目
    await getItem();     // 读取项目
    await updateItem();  // 更新项目
    // await deleteItem();  // 删除项目
};

run();
