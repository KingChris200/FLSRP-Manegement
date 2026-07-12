const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    ChannelType,
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('announce')
        .setDescription('Send a professional server announcement.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)

        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('The channel where the announcement will be sent.')
                .addChannelTypes(
                    ChannelType.GuildText,
                    ChannelType.GuildAnnouncement
                )
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName('title')
                .setDescription('The title of the announcement.')
                .setMaxLength(256)
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('The main announcement message.')
                .setMaxLength(4000)
                .setRequired(true)
        )

        .addStringOption(option =>
            option
                .setName('color')
                .setDescription('Choose the announcement color.')
                .addChoices(
                    { name: 'Red', value: 'Red' },
                    { name: 'Blue', value: 'Blue' },
                    { name: 'Green', value: 'Green' },
                    { name: 'Gold', value: 'Gold' },
                    { name: 'Purple', value: 'Purple' },
                    { name: 'Orange', value: 'Orange' }
                )
                .setRequired(false)
        )

        .addRoleOption(option =>
            option
                .setName('ping')
                .setDescription('Optionally ping a role with the announcement.')
                .setRequired(false)
        )

        .addStringOption(option =>
            option
                .setName('image')
                .setDescription('Optional image URL for the announcement.')
                .setRequired(false)
        )

        .addStringOption(option =>
            option
                .setName('footer')
                .setDescription('Optional custom footer text.')
                .setMaxLength(2048)
                .setRequired(false)
        ),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        const title = interaction.options.getString('title');
        const message = interaction.options.getString('message');
        const color = interaction.options.getString('color') || 'Blue';
        const pingRole = interaction.options.getRole('ping');
        const image = interaction.options.getString('image');
        const customFooter = interaction.options.getString('footer');

        if (!channel || !channel.isTextBased()) {
            return interaction.reply({
                content: '❌ Please select a valid text channel.',
                ephemeral: true,
            });
        }

        const embed = new EmbedBuilder()
            .setColor(color)
            .setAuthor({
                name: interaction.guild.name,
                iconURL:
                    interaction.guild.iconURL({ dynamic: true }) || undefined,
            })
            .setTitle(`📢 ${title}`)
            .setDescription(message)
            .setFooter({
                text:
                    customFooter ||
                    `Posted by ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL({
                    dynamic: true,
                }),
            })
            .setTimestamp();

        if (image) {
            try {
                embed.setImage(image);
            } catch {
                return interaction.reply({
                    content:
                        '❌ That image URL does not appear to be valid. Please use a direct HTTPS image link.',
                    ephemeral: true,
                });
            }
        }

        try {
            await channel.send({
                content: pingRole ? `${pingRole}` : undefined,
                embeds: [embed],
                allowedMentions: {
                    roles: pingRole ? [pingRole.id] : [],
                },
            });

            await interaction.reply({
                content: `✅ Announcement sent successfully in ${channel}.`,
                ephemeral: true,
            });
        } catch (error) {
            console.error('Announcement error:', error);

            await interaction.reply({
                content:
                    '❌ I could not send that announcement. Make sure I have permission to view and send messages in the selected channel.',
                ephemeral: true,
            });
        }
    },
};