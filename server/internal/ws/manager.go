package ws

import (
	"sync"
)

type WSManager struct {
	// map userID -> set of socketUUIDs
	connections sync.Map
}

func NewWSManager() *WSManager {
	return &WSManager{}
}

func (m *WSManager) Add(userID string, socketUUID string) {
	actual, _ := m.connections.LoadOrStore(userID, &sync.Map{})
	userConns := actual.(*sync.Map)
	userConns.Store(socketUUID, true)
}

func (m *WSManager) Remove(userID string, socketUUID string) {
	if actual, ok := m.connections.Load(userID); ok {
		userConns := actual.(*sync.Map)
		userConns.Delete(socketUUID)
	}
}

func (m *WSManager) GetUserUUIDs(userID string) []string {
	var uuids []string
	if actual, ok := m.connections.Load(userID); ok {
		userConns := actual.(*sync.Map)
		userConns.Range(func(key, value interface{}) bool {
			uuids = append(uuids, key.(string))
			return true
		})
	}
	return uuids
}
