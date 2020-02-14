class RemoveAttributeFromTable < ActiveRecord::Migration[5.2]
  def change
    remove_column  :type_races, :current_user_id, :integer
    remove_column  :user_progresses,  :type_race_id, :integer
  end
end
