class RemoveFieldNameFromTableName < ActiveRecord::Migration[5.2]
  def change
    remove_column :type_races, :user_id, :integer
  end
end
