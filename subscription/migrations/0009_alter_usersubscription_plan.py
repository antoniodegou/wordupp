# Generated by Django 4.2.3 on 2023-09-22 18:43

from django.db import migrations, models
import django.db.models.deletion
import subscription.models


class Migration(migrations.Migration):

    dependencies = [
        ('subscription', '0008_remove_usersubscription_pending_downgrade_date'),
    ]

    operations = [
        migrations.AlterField(
            model_name='usersubscription',
            name='plan',
            field=models.ForeignKey(default=subscription.models.get_default_plan, null=True, on_delete=django.db.models.deletion.SET_NULL, to='subscription.subscriptionplan'),
        ),
    ]