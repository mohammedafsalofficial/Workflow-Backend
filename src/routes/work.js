const express = require('express');
const workspaceController = require('../controllers/workspacecontroller');
const router = express.Router();

module.exports = (io) => {

    io.on('connection', (socket) => {
        console.log('A user connected in Workmanagement');

        // Work-related events
        socket.on('getWorkspaces', async (data, callback) => {
            const {moduleId, token} = data;
            const workspaces = await workspaceController.getWorkspaces(token, moduleId);
            callback(workspaces);
        });

        socket.on('getBoardsByWorkspaceById', async (data, callback) => {
            const {id}=data;
            const workspace = await workspaceController.getWorkspaceById(id);
            callback(workspace);
        });
        
        socket.on('getWorkspaceDetailsById', async (data, callback) => {
            const {id}=data;
            const workspace = await workspaceController.getWorkspaceDetailsById(id);
            callback(workspace);
        });

        socket.on('createWorkspace', async (data, callback) => {
            const {moduleId , workspaceData} =data;
            workspaceData.moduleId = moduleId;
            const workspace = await workspaceController.createWorkspace(workspaceData);
            callback(workspace);
        });

        socket.on('updateWorkspaceById', async (data, callback) => {
            const { id, updateData } = data;
            const updatedWorkspace = await workspaceController.updateWorkspace(id, updateData);
            callback(updatedWorkspace);
        });

        socket.on('deleteWorkspaceById', async (data, callback) => {
            const  {id, moduleId}  = data;
            const result = await workspaceController.deleteWorkspace(id, moduleId);
            callback(result);
        });

        socket.on('addMemberToWorkspace', async (data, callback) => {
            const { id, members, token } = data;
            const response = await workspaceController.addMemberToWorkspace(id, members, token);
            callback(response);
        });
        
        
        socket.on('addMemberToWorkspace', async (data, callback) => {
            const { id, members, token } = data;
            const response = await workspaceController.removeMemberToWorkspace(id, members, token);
            callback(response);
        });

        // Board events
        socket.on('addBoardToWorkspace', async (data, callback) => {
            const { id, board } = data;
            const updatedWorkspace = await workspaceController.addBoardToWorkspace(id, board);
            callback(updatedWorkspace);
        });

        socket.on('removeBoardFromWorkspace', async (data, callback) => {
            const { boardId } = data;
            const updatedWorkspace = await workspaceController.removeBoardFromWorkspace(boardId);
            callback(updatedWorkspace);
        });

        socket.on('updateBoardInWorkspace', async (data, callback) => {
            const { boardId, updateData } = data;
            const updatedBoard = await workspaceController.updateBoardInWorkspace(boardId, updateData);
            callback(updatedBoard);
        });

        socket.on('getBoardById', async (data, callback) => {
            const { boardId, type} = data;
            const board = await workspaceController.getBoardById(boardId, type);
            callback(board);
        });

        // Group events
        socket.on('addGroupToBoard', async (data, callback) => {
            const { boardId, group, type } = data;
            const updatedBoard = await workspaceController.addGroupToBoard(boardId, group, type);
            callback(updatedBoard);
        });

        socket.on('removeGroupFromBoard', async (data, callback) => {
            const { groupId, type } = data;
            const updatedBoard = await workspaceController.removeGroupFromBoard(groupId, type);
            callback(updatedBoard);
        });

        socket.on('updateGroupInBoard', async (data, callback) => {
            const { groupId, updateData } = data;
            const updatedGroup = await workspaceController.updateGroupInBoard(groupId, updateData);
            callback(updatedGroup);
        });

        // Item events
        socket.on('addItemToGroup', async (data, callback) => {
            const { groupId, item, type } = data;
            const updatedGroup = await workspaceController.addItemToGroup(groupId, item, type);
            callback(updatedGroup);
        });

        socket.on('createItem', async (data, callback) => {
            const { item, type } = data;
            const itemData = await workspaceController.addItem(item, type);
            callback(itemData);
        });

        socket.on('removeItemFromGroup', async (data, callback) => {
            const { itemId, group, type } = data;
            const updatedGroup = await workspaceController.removeItemFromGroup(itemId, group, type);
            callback(updatedGroup);
        });

        socket.on('updateItemInGroup', async (data, callback) => {
            const { itemId, updateData, type } = data;
            const updatedItem = await workspaceController.updateItemInGroup(itemId, updateData, type);
            callback(updatedItem);
        });

        socket.on('addMembersToItem', async (data, callback) => {
            const { itemId, userId, type } = data;
            const updatedItem = await workspaceController.addMembersToItem(itemId, userId, type);
            callback(updatedItem);
        });

        socket.on('removeMembersFromItem', async (data, callback) => {
            const { itemId, userId, type } = data;
            try {
                const updatedItem = await workspaceController.removeMembersFromItem(itemId, userId, type);
                callback(updatedItem);
            } catch (err) {
                callback({ error: err.message });
            }
        });        

        socket.on('disconnect', () => {
            console.log('A user disconnected');
        });
    });
    return router;
};
