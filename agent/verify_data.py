from functions.sender import sender

def verify_all_data():
    """Test all data senders"""
    results = {
        "agent_identity": sender.send_agent_identity(),
        "system_info": sender.send_system_info(),
        "process_list": sender.send_process_list()
    }
    
    print("\nVerification Results:")
    for event, success in results.items():
        print(f"{event}: {'✅ Sent' if success else '❌ Failed'}")

if __name__ == "__main__":
    verify_all_data()